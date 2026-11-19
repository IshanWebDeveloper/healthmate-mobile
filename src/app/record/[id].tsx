import { router, Stack, useLocalSearchParams } from "expo-router";
import { IconButton, Snackbar } from "react-native-paper";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { RecordForm } from "@/components/record-form";
import { useRecordEditor } from "@/hooks/use-record-editor";
import { LoadingScreen } from "@/components/ui/loading-screen";

/** Add (`/record/new`) and Edit (`/record/<id>`) share one modal screen and one form. */
export default function RecordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    isNew,
    initial,
    notFound,
    error,
    confirmingDelete,
    save,
    requestDelete,
    cancelDelete,
    confirmDelete,
    dismissError,
  } = useRecordEditor(id);

  const close = () =>
    router.canGoBack() ? router.back() : router.replace("/");

  const handleDelete = async () => {
    if (await confirmDelete()) close();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isNew ? "Add record" : "Edit record",
          headerRight:
            isNew || notFound
              ? undefined
              : () => (
                  <IconButton
                    icon="delete-outline"
                    accessibilityLabel="Delete record"
                    onPress={requestDelete}
                  />
                ),
        }}
      />
      {notFound ? (
        <EmptyState
          icon="file-question-outline"
          title="Record not found"
          message="That record no longer exists."
          actionLabel="Go back"
          onAction={close}
        />
      ) : initial ? (
        <RecordForm
          key={id}
          defaultValues={initial}
          submitLabel={isNew ? "Save record" : "Save changes"}
          onCancel={close}
          onSubmit={async (values) => {
            if (await save(values)) close();
          }}
        />
      ) : (
        <LoadingScreen />
      )}
      <ConfirmDialog
        visible={confirmingDelete}
        title="Delete this record?"
        message="This permanently removes the record."
        confirmLabel="Delete"
        onConfirm={() => void handleDelete()}
        onDismiss={cancelDelete}
      />
      <Snackbar visible={!!error} onDismiss={dismissError}>
        {error}
      </Snackbar>
    </>
  );
}
